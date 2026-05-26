package com.example.refillostaff.data.local

import android.content.Context
import android.content.SharedPreferences

class SessionManager(context: Context) {
    private var prefs: SharedPreferences = context.getSharedPreferences("RefilloPrefs", Context.MODE_PRIVATE)

    fun saveAuthToken(token: String) {
        val editor = prefs.edit()
        editor.putString("USER_TOKEN", token)
        editor.apply()
    }

    fun fetchAuthToken(): String? {
        return prefs.getString("USER_TOKEN", null)
    }

    fun clearSession() {
        prefs.edit().clear().apply()
    }

    fun saveUserRole(role: String) {
        prefs.edit().putString("USER_ROLE", role).apply()
    }

    fun fetchUserRole(): String? {
        return prefs.getString("USER_ROLE", null)
    }

    fun saveUserDetails(name: String, email: String) {
        prefs.edit()
            .putString("USER_NAME", name)
            .putString("USER_EMAIL", email)
            .apply()
    }

    fun fetchUserName(): String = prefs.getString("USER_NAME", "Користувач") ?: "Користувач"
    fun fetchUserEmail(): String = prefs.getString("USER_EMAIL", "") ?: ""
}