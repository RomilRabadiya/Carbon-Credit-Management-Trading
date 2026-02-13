package com.carboncredit.userservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    private String name;

    private String picture;

    private String password;

    // RBAC Fields
    private String role; // USER, ORGANIZATION, VERIFIER

    @Builder.Default
    @com.fasterxml.jackson.annotation.JsonProperty("isProfileComplete")
    private boolean isProfileComplete = false;

    private Long organizationId;
}
