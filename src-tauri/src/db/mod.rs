pub mod notes;

use rusqlite::Connection;
use std::sync::Mutex;

pub struct DbConnection(pub Mutex<Connection>);

pub fn init_db(app_dir: &std::path::Path) -> Result<DbConnection, rusqlite::Error> {
    std::fs::create_dir_all(app_dir).ok();
    let db_path = app_dir.join("notes.db");
    let conn = Connection::open(db_path)?;

    conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;")?;

    run_migrations(&conn)?;

    Ok(DbConnection(Mutex::new(conn)))
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
