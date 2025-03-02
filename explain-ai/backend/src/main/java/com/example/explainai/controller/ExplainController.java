package com.example.explainai.controller;

import com.example.explainai.model.ExplanationRequest;
import com.example.explainai.model.ExplanationResponse;
import com.example.explainai.service.ExplanationService;

import lombok.extern.slf4j.Slf4j;

import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = {"*"})
@RequestMapping("/api")
@Slf4j
public class ExplainController {

    private final ExplanationService explanationService;

    public ExplainController(ExplanationService explanationService) {
        this.explanationService = explanationService;
    }

    @PostMapping("/explain")
    public ExplanationResponse explain(@RequestBody ExplanationRequest request) {
        log.info(request.toString());
        return explanationService.getExplanation(request);
    }
}
