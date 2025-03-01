package com.chatbot.aiagent;

import org.springframework.ai.openai.OpenAiChatClient;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

@Service
@Qualifier("openAiChatClient")
public class OpenAiChatService implements ChatClient {

    private final OpenAiChatClient openAiChatClient;

    public OpenAiChatService(OpenAiChatClient openAiChatClient) {
        this.openAiChatClient = openAiChatClient;
    }

    @Override
    public String call(String message) {
        return openAiChatClient.call(message);
    }
}
