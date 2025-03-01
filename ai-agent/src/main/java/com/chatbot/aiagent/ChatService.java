package com.chatbot.aiagent;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ChatService {

    private final ChatClient chatClient;

    public ChatService(
        @Value("${chat.provider}") String chatProvider,
        @Qualifier("openAiChatClient") ChatClient openAiChatService,
        @Qualifier("localTransformerChatClient") ChatClient localTransformerChatService
    ) {
        if ("local".equalsIgnoreCase(chatProvider)) {
            this.chatClient = localTransformerChatService;
        } else {
            this.chatClient = localTransformerChatService;
        }
    }

    public String getResponse(String userMessage) {
        try {
            return chatClient.call(userMessage);
        } catch (Exception ex) {
            return "Sorry, I'm having trouble responding right now.";
        }
    }
}
