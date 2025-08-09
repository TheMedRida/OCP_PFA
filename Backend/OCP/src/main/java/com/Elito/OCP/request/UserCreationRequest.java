package com.Elito.OCP.request;


import com.Elito.OCP.domain.USER_ROLE;

public class UserCreationRequest {
    private String fullName;
    private String email;
    private String tel;
    private USER_ROLE role;

    // Default constructor
    public UserCreationRequest() {}

    // Parameterized constructor
    public UserCreationRequest(String fullName, String email,String tel, USER_ROLE role) {
        this.fullName = fullName;
        this.email = email;
        this.tel = tel;
        this.role = role;
    }

    // Getters and setters
    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public USER_ROLE getRole() {
        return role;
    }

    public void setRole(USER_ROLE role) {
        this.role = role;
    }

    public String getTel() {
        return tel;
    }

    public void setTel(String tel) {
        this.tel = tel;
    }
}
