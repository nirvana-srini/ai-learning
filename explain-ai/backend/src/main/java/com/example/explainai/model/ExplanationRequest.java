package com.example.explainai.model;

import lombok.Data;

@Data
public class ExplanationRequest {
    private String selectedText;
    private String topic;
    private String pre;
    private String post;
}
