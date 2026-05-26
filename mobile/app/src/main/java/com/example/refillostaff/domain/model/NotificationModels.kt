package com.example.refillostaff.domain.model

data class NotificationResponse(
    val id: String,
    val userId: String,
    val type: String,
    val messageText: String,
    val isRead: Boolean,
    val createdAt: String
)