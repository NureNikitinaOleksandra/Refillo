package com.example.refillostaff.domain.model

data class LoginRequest(
    val email: String,
    val password: String
)

data class LoginResponse(
    val token: String,
    val user: User
)

data class User(
    val id: String,
    val name: String,
    val role: String
)

data class UserProfileResponse(
    val id: String,
    val name: String,
    val email: String,
    val phone: String?,
    val role: String,
    val createdAt: String
)