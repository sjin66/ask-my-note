use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum AiProvider {
    BigModel,
    OpenAI,
}

impl Default for AiProvider {
    fn default() -> Self {
        AiProvider::BigModel
    }
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

    pub fn chat_model(&self) -> &str {
        match self {
            AiProvider::BigModel => "glm-4",
            AiProvider::OpenAI => "gpt-4o",
        }
    }

    pub fn embedding_dims(&self) -> usize {
        // Standardized to 1024 for both providers
        // BigModel embedding-2: native 1024
        // OpenAI text-embedding-3-small: reduced from 1536 via dimensions param
        1024
    }

    pub fn display_name(&self) -> &str {
        match self {
            AiProvider::BigModel => "BigModel (GLM)",
            AiProvider::OpenAI => "OpenAI",
        }
    }
}
