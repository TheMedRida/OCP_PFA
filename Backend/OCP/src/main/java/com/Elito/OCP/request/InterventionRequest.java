package com.Elito.OCP.request;


public class InterventionRequest {
    private String title;
    private String description;

    // Default constructor
    public InterventionRequest() {}

    // Parameterized constructor
    public InterventionRequest(String title, String description) {
        this.title = title;
        this.description = description;
    }

    // Getters and setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
