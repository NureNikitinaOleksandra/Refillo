package com.example.refillostaff.presentation.queue

import android.content.res.ColorStateList
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.example.refillostaff.R
import com.example.refillostaff.databinding.ItemOrderBinding
import com.example.refillostaff.domain.model.OrderResponse
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

class OrderAdapter(
    private var items: List<OrderResponse>,
    private val userRole: String, // Передаємо роль (EMPLOYEE або COURIER)
    private val onItemClick: (OrderResponse) -> Unit // Клік для відкриття деталей
) : RecyclerView.Adapter<OrderAdapter.OrderViewHolder>() {

    fun updateData(newItems: List<OrderResponse>) {
        this.items = newItems
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): OrderViewHolder {
        val binding = ItemOrderBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return OrderViewHolder(binding)
    }

    override fun onBindViewHolder(holder: OrderViewHolder, position: Int) {
        holder.bind(items[position], userRole, onItemClick)
    }

    override fun getItemCount(): Int = items.size

    class OrderViewHolder(private val binding: ItemOrderBinding) : RecyclerView.ViewHolder(binding.root) {

        fun bind(order: OrderResponse, role: String, onItemClick: (OrderResponse) -> Unit) {
            val context = binding.root.context

            binding.tvOrderNumber.text = "Замовлення №${order.orderNumber}"

            // Якщо deliveryTime null, показуємо дату створення
            val timeString = order.deliveryTime ?: order.createdAt
            binding.tvDeliveryTime.text = formatTime(timeString)

            binding.tvStatus.text = translateStatus(order.orderStatus)

            // ДИНАМІЧНА ІКОНКА ТА КОЛІР ЗА РОЛЛЮ
            if (role == "COURIER") {
                binding.ivIcon.setImageResource(R.drawable.ic_local_shipping)
                binding.ivIcon.imageTintList = ColorStateList.valueOf(ContextCompat.getColor(context, R.color.brand_orange))
                binding.tvDeliveryTime.setTextColor(ContextCompat.getColor(context, R.color.brand_orange))
            } else {
                binding.ivIcon.setImageResource(R.drawable.ic_box)
                binding.ivIcon.imageTintList = ColorStateList.valueOf(ContextCompat.getColor(context, R.color.brand_yellow))
                binding.tvDeliveryTime.setTextColor(ContextCompat.getColor(context, R.color.brand_yellow))
            }

            // Обробка кліку на картку
            binding.root.setOnClickListener {
                onItemClick(order)
            }
        }

        private fun formatTime(iso: String): String {
            return try {
                val parser = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault()).apply { timeZone = TimeZone.getTimeZone("UTC") }
                val formatter = SimpleDateFormat("dd MMM, HH:mm", Locale("uk", "UA"))
                formatter.format(parser.parse(iso)!!)
            } catch (e: Exception) { iso }
        }

        private fun translateStatus(status: String): String {
            return when (status) {
                "CREATED" -> "Створено"
                "IN_PROCESS" -> "В обробці"
                "COLLECTED" -> "Зібрано"
                "ACCEPTED_BY_COURIER" -> "Прийнято кур'єром"
                "EN_ROUTE" -> "В дорозі"
                "DELIVERED" -> "Доставлено"
                else -> status
            }
        }
    }
}