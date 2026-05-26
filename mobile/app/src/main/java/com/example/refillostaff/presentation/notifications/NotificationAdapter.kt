package com.example.refillostaff.presentation.notifications

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.RecyclerView
import com.example.refillostaff.R
import com.example.refillostaff.databinding.ItemNotificationBinding
import com.example.refillostaff.domain.model.NotificationResponse
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

class NotificationAdapter(
    private var items: List<NotificationResponse>,
    private val userRole: String, // Передаємо роль
    private val onReadClick: (String) -> Unit // Лямбда для кліку
) : RecyclerView.Adapter<NotificationAdapter.NotificationViewHolder>() {

    fun updateData(newItems: List<NotificationResponse>) {
        this.items = newItems
        notifyDataSetChanged() // Оновлюємо список на екрані
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): NotificationViewHolder {
        val binding = ItemNotificationBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return NotificationViewHolder(binding)
    }

    override fun onBindViewHolder(holder: NotificationViewHolder, position: Int) {
        holder.bind(items[position], userRole, onReadClick)
    }

    override fun getItemCount(): Int = items.size

    class NotificationViewHolder(private val binding: ItemNotificationBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(notification: NotificationResponse, role: String, onReadClick: (String) -> Unit) {
            binding.tvMessage.text = notification.messageText
            binding.tvTime.text = formatDate(notification.createdAt)

            val context = binding.root.context

            if (notification.isRead) {
                // Якщо прочитане: темна смужка, тьмяна картка, кнопка ховається
                binding.vStripe.setBackgroundColor(ContextCompat.getColor(context, R.color.brand_dark))
                binding.root.alpha = 0.5f
                binding.btnRead.visibility = View.GONE
            } else {
                // Якщо НЕ прочитане: яскрава смужка за роллю, картка яскрава, кнопка є
                val stripeColor = if (role == "COURIER") R.color.brand_orange else R.color.brand_yellow
                binding.vStripe.setBackgroundColor(ContextCompat.getColor(context, stripeColor))
                binding.root.alpha = 1.0f
                binding.btnRead.visibility = View.VISIBLE

                binding.btnRead.setOnClickListener {
                    onReadClick(notification.id)
                }
            }
        }

        private fun formatDate(iso: String): String {
            return try {
                val parser = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault()).apply { timeZone = TimeZone.getTimeZone("UTC") }
                val formatter = SimpleDateFormat("dd MMMM, HH:mm", Locale("uk", "UA"))
                formatter.format(parser.parse(iso)!!)
            } catch (e: Exception) { iso }
        }
    }
}