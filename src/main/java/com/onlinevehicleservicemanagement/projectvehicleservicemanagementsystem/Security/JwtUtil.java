package com.onlinevehicleservicemanagement.projectvehicleservicemanagementsystem.Security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    private static final String SECRET = "AutoServeSecretKey2024AutoServeSecretKey2024!!";
    private static final long EXPIRY = 86400000L * 7; // 7 days

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    // ── Token Generate ────────────────────────────────
    public String generateToken(Long garageId, String username, String role) {
        return Jwts.builder()
                .subject(username)                                        // ✅ 0.12.x
                .claim("garageId", garageId)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRY))
                .signWith(getKey())                                       // ✅ 0.12.x
                .compact();
    }

    // ── Extract Username ──────────────────────────────
    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    // ── Extract GarageId ─────────────────────────────
    public Long extractGarageId(String token) {
        Object val = getClaims(token).get("garageId");
        if (val == null) return null;
        return ((Number) val).longValue();
    }

    // ── Extract Role ──────────────────────────────────
    public String extractRole(String token) {
        return (String) getClaims(token).get("role");
    }

    // ── Validate Token ────────────────────────────────
    public boolean validateToken(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    // ── Helpers ───────────────────────────────────────
    private Claims getClaims(String token) {
        return Jwts.parser()                                              // ✅ 0.12.x
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private boolean isTokenExpired(String token) {
        return getClaims(token).getExpiration().before(new Date());
    }
}