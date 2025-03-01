package com.chatbot.aiagent;


import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
@Controller
public class ChatWebSocketController {
    private final ChatService chatService;
    
    public ChatWebSocketController(ChatService chatService) {
        this.chatService = chatService;
    }
    
    @MessageMapping("/message")
    @SendTo("/topic/response")
    public String chat(String userMessage) {
        return chatService.getResponse(userMessage);
    }
}