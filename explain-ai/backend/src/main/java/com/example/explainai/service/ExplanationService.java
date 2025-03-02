package com.example.explainai.service;

import com.example.explainai.model.ExplanationRequest;
import com.example.explainai.model.ExplanationResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
public class ExplanationService {

    @Value("${ml.service.url}")
    private String mlServiceUrl;

    private final RestTemplate restTemplate;

    public ExplanationService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Cacheable(cacheNames = "explanations", key = "#request.toString()")
    public ExplanationResponse getExplanation(ExplanationRequest request) {
        log.info("Cache miss for request: {}", request);
        ResponseEntity<ExplanationResponse> response = restTemplate.postForEntity(
                mlServiceUrl,
                request,
                ExplanationResponse.class
        );
        log.info(response.toString());
        ExplanationResponse result = response.getBody();
        log.info("Caching response: {}", result);
        return result;
    }
}
