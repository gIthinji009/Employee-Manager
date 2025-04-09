package com.example.employeemanager.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.function.Function;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

@Component
public class JwtUtil {

    private final Key accessTokenSecret;
    private final Key refreshTokenSecret;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;

    public JwtUtil(
            @Value("${jwt.secret.access}") String accessSecret,
            @Value("${jwt.secret.refresh}") String refreshSecret,
            @Value("${jwt.expiration.access}") long accessTokenExpiration,
            @Value("${jwt.expiration.refresh}") long refreshTokenExpiration)
    {
        this.accessTokenSecret = Keys.hmacShaKeyFor(accessSecret.getBytes());
        this.refreshTokenSecret = Keys.hmacShaKeyFor(refreshSecret.getBytes());
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;

    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }


    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(accessTokenSecret)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            throw new JwtException("Expired JWT token");
        } catch (UnsupportedJwtException e) {
            throw new JwtException("Unsupported JWT token");
        } catch (MalformedJwtException e) {
            throw new JwtException("Invalid JWT token format");
        } catch (SignatureException e) {
            throw new JwtException("Invalid JWT signature");
        } catch (IllegalArgumentException e) {
            throw new JwtException("JWT token is empty or invalid");
        }
    }

    public boolean validateToken(String token, boolean isAccessToken) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(isAccessToken ? accessTokenSecret : refreshTokenSecret)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
    public String generateAccessToken(UserDetails userDetails) {
        return buildToken(userDetails, accessTokenSecret, accessTokenExpiration);
    }

    public String generateRefreshToken(UserDetails userDetails) {
        return buildToken(userDetails, refreshTokenSecret, refreshTokenExpiration);
    }
    private String buildToken(UserDetails userDetails, Key secret, long expiration) {
        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .claim("roles", getRoles(userDetails))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(secret, SignatureAlgorithm.HS256)
                .compact();
    }
    private List<String> getRoles(UserDetails userDetails) {
        return userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
    }

    public String generateToken(UserDetails userDetails) {
        return buildToken(userDetails, accessTokenSecret, accessTokenExpiration);
    }
    public String getUsernameFromToken(String token, boolean isAccessToken) {
        return Jwts.parserBuilder()
                .setSigningKey(isAccessToken ? accessTokenSecret : refreshTokenSecret)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

}