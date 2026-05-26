package com.example.refillostaff.data.remote

import com.example.refillostaff.domain.model.LoginRequest
import com.example.refillostaff.domain.model.LoginResponse
import com.example.refillostaff.domain.model.NotificationResponse
import com.example.refillostaff.domain.model.OrderResponse
import com.example.refillostaff.domain.model.StatusUpdateRequest
import com.example.refillostaff.domain.model.UserProfileResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path

interface ApiService {
    @POST("/api/auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @GET("/api/users/profile")
    suspend fun getProfile(
        @Header("Authorization") token: String
    ): Response<UserProfileResponse>

    @GET("/api/staff/notifications")
    suspend fun getNotifications(
        @Header("Authorization") token: String
    ): retrofit2.Response<List<NotificationResponse>>

    @PATCH("/api/notifications/{id}/read")
    suspend fun markNotificationAsRead(
        @Header("Authorization") token: String,
        @Path("id") id: String
    ): Response<Unit>

    @PATCH("/api/notifications/read-all")
    suspend fun markAllNotificationsAsRead(
        @Header("Authorization") token: String
    ): Response<Unit>

    @GET("/api/staff/queue")
    suspend fun getWorkQueue(@Header("Authorization") token: String): Response<List<OrderResponse>>

    @GET("/api/staff/history")
    suspend fun getStaffHistory(@Header("Authorization") token: String): Response<List<OrderResponse>>

    // Запит для динамічної кнопки
    @PATCH("/api/staff/orders/{id}/status")
    suspend fun updateOrderStatus(
        @Header("Authorization") token: String,
        @Path("id") orderId: String,
        @Body request: StatusUpdateRequest
    ): Response<OrderResponse>
}