package com.example.refillostaff.presentation.profile

import android.content.Intent
import android.content.res.ColorStateList
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import com.example.refillostaff.R
import com.example.refillostaff.data.local.SessionManager
import com.example.refillostaff.data.remote.ApiClient
import com.example.refillostaff.databinding.FragmentProfileBinding
import com.example.refillostaff.domain.model.UserProfileResponse
import com.example.refillostaff.presentation.login.LoginActivity
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

class ProfileFragment : Fragment() {

    private var _binding: FragmentProfileBinding? = null
    private val binding get() = _binding!!
    private lateinit var sessionManager: SessionManager

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentProfileBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        sessionManager = SessionManager(requireContext())

        loadUserProfile()

        binding.btnLogout.setOnClickListener {
            sessionManager.clearSession()
            val intent = Intent(requireActivity(), LoginActivity::class.java)
            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            startActivity(intent)
        }
    }

    private fun loadUserProfile() {
        val token = sessionManager.fetchAuthToken()
        if (token == null) {
            redirectToLogin()
            return
        }

        viewLifecycleOwner.lifecycleScope.launch(Dispatchers.IO) {
            try {
                val response = ApiClient.apiService.getProfile(token)

                withContext(Dispatchers.Main) {
                    if (response.isSuccessful && response.body() != null) {
                        val profile = response.body()!!
                        updateUI(profile)
                    } else {
                        Toast.makeText(
                            requireContext(),
                            "Помилка завантаження профілю",
                            Toast.LENGTH_SHORT
                        ).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(requireContext(), "Помилка мережі", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun updateUI(profile: UserProfileResponse) {
        binding.tvName.text = profile.name
        binding.tvEmail.text = profile.email
        binding.tvWorkSince.text = "Працює в Refillo з: ${formatDate(profile.createdAt)}"

        val firstLetter = if (profile.name.isNotEmpty()) profile.name.substring(0, 1).uppercase() else "?"
        binding.tvAvatar.text = firstLetter

        val colorRes = if (profile.role == "COURIER") R.color.brand_orange else R.color.brand_yellow
        binding.tvAvatar.backgroundTintList = ColorStateList.valueOf(
            ContextCompat.getColor(requireContext(), colorRes)
        )
    }

    private fun formatDate(isoDateString: String): String {
        return try {
            val parser = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
            parser.timeZone = TimeZone.getTimeZone("UTC")
            val formatter = SimpleDateFormat("dd MMMM yyyy", Locale("uk", "UA"))

            val date = parser.parse(isoDateString)
            if (date != null) formatter.format(date) else isoDateString
        } catch (e: Exception) {
            isoDateString
        }
    }

    private fun redirectToLogin() {
        val intent = Intent(requireActivity(), LoginActivity::class.java)
        startActivity(intent)
        requireActivity().finish()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}