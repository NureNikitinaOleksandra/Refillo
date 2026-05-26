package com.example.refillostaff.domain.model

data class OrderResponse(
    val id: String,
    val orderNumber: String,
    val orderStatus: String,
    val paymentStatus: String,
    val paymentMethod: String,
    val deliveryAddress: String?,
    val deliveryTime: String?, // Може бути null
    val totalPrice: Double,
    val createdAt: String,
    val orderItems: List<OrderItemResponse>,
    val user: CustomerInfo? // Може бути null (для Історії)
)

data class CustomerInfo(
    val name: String,
    val phone: String
)

data class OrderItemResponse(
    val id: String,
    val quantity: Int,
    val priceAtPurchase: Double,
    val product: ProductShort
)

data class ProductShort(
    val name: String,
    val imageUrl: String?
)

// Додатковий клас для відправки нового статусу на бекенд
data class StatusUpdateRequest(
    val status: String
)