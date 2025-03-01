package com.chatbot.aiagent;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Service
@Qualifier("localTransformerChatClient")
public class LocalTransformerChatService implements ChatClient {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public LocalTransformerChatService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("http://localhost:5001").build();
        this.objectMapper = new ObjectMapper();

    }

    @Override
    public String call(String message) {
        try {
            String jsonResponse = webClient.post()
                    .uri("/chat")
                    .bodyValue("{\"message\":\"" + message + "\"}")
                    .header("Content-Type", "application/json") // Add this line
                    .retrieve()
                    .bodyToMono(String.class)
                    .block(); // Synchronous call
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            return rootNode.path("response").asText();
        } catch (WebClientResponseException e) {
            return "Error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString();
        }  catch (Exception e) {
            e.printStackTrace();
            return "Error: Unable to reach the local transformer model.";
        }
    }
}
