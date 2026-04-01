pub mod chunks;
pub mod notes;

use rusqlite::{Connection, ffi::sqlite3_auto_extension};
use std::sync::{Arc, Mutex, Once};

#[derive(Clone)]
pub struct DbConnection(pub Arc<Mutex<Connection>>);

static INIT_VEC: Once = Once::new();

pub fn init_db(app_dir: &std::path::Path) -> Result<DbConnection, rusqlite::Error> {
    // Register sqlite-vec as auto extension (once, before any connection)
    INIT_VEC.call_once(|| {
        unsafe {
            sqlite3_auto_extension(Some(std::mem::transmute(
                sqlite_vec::sqlite3_vec_init as *const (),
            )));
        }
    });

    std::fs::create_dir_all(app_dir).ok();
    let db_path = app_dir.join("notes.db");
    let conn = Connection::open(db_path)?;

    conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;")?;

    run_migrations(&conn)?;

    // Create vec virtual table (idempotent — CREATE IF NOT EXISTS not supported by vec0)
    let vec_exists: bool = conn.query_row(
        "SELECT COUNT(*) > 0 FROM sqlite_master WHERE type='table' AND name='vec_chunks'",
        [],
        |row| row.get(0),
    )?;
    if !vec_exists {
        conn.execute_batch("CREATE VIRTUAL TABLE vec_chunks USING vec0(embedding float[1536]);")?;
    }

    Ok(DbConnection(Arc::new(Mutex::new(conn))))
}

fn run_migrations(conn: &Connection) -> Result<(), rusqlite::Error> {
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS _migrations (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            applied_at TEXT NOT NULL
        );"
    )?;

    let migrations: Vec<(&str, &str)> = vec![
        ("001_create_notes", include_str!("migrations/001_create_notes.sql")),
        ("002_create_chunks", include_str!("migrations/002_create_chunks.sql")),
    ];

    for (name, sql) in migrations {
        let already_applied: bool = conn.query_row(
            "SELECT COUNT(*) > 0 FROM _migrations WHERE name = ?1",
            [name],
            |row| row.get(0),
        )?;

        if !already_applied {
            conn.execute_batch(sql)?;
            conn.execute(
                "INSERT INTO _migrations (name, applied_at) VALUES (?1, datetime('now'))",
                [name],
            )?;
        }
    }

    Ok(())
}
