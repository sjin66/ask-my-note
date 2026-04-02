use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Default, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum AiProvider {
    #[default]
    BigModel,
    OpenAI,
}

impl AiProvider {
    pub fn base_url(&self) -> &str {
        match self {
            AiProvider::BigModel => "https://open.bigmodel.cn/api/paas/v4/",
            AiProvider::OpenAI => "https://api.openai.com/v1",
        }
    }

    pub fn embedding_model(&self) -> &str {
        match self {
            AiProvider::BigModel => "embedding-2",
            AiProvider::OpenAI => "text-embedding-3-small",
        }
    }

    /// Used by the upcoming chat service (Phase 5)
    #[allow(dead_code)]
    pub fn chat_model(&self) -> &str {
        match self {
            AiProvider::BigModel => "glm-4",
            AiProvider::OpenAI => "gpt-4o",
        }
    }

    #[allow(dead_code)]
    pub fn display_name(&self) -> &str {
        match self {
            AiProvider::BigModel => "BigModel (GLM)",
            AiProvider::OpenAI => "OpenAI",
        }
    }
}
