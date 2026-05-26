package com.example.refillostaff.presentation.queue

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.refillostaff.databinding.ItemDetailProductBinding
import com.example.refillostaff.domain.model.OrderItemResponse

class OrderDetailItemAdapter(
    private val items: List<OrderItemResponse>
) : RecyclerView.Adapter<OrderDetailItemAdapter.ItemViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ItemViewHolder {
        val binding = ItemDetailProductBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return ItemViewHolder(binding)
    }

    override fun onBindViewHolder(holder: ItemViewHolder, position: Int) {
        holder.bind(items[position])
    }

    override fun getItemCount(): Int = items.size

    class ItemViewHolder(private val binding: ItemDetailProductBinding) : RecyclerView.ViewHolder(binding.root) {
        fun bind(item: OrderItemResponse) {
            binding.tvProductName.text = item.product.name
            binding.tvQuantity.text = "${item.quantity} шт."
            binding.tvPrice.text = "${item.priceAtPurchase} ₴/шт."
        }
    }
}