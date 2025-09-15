package com.example.backend.security.config;

import com.example.backend.security.google_facebook_auth.OAuth2SuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

  private final OAuth2SuccessHandler successHandler;

  @Bean
  SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
      .csrf(csrf -> csrf.disable())
      .cors(cors -> cors.configurationSource(request -> {
        CorsConfiguration c = new CorsConfiguration();
        c.setAllowedOrigins(List.of("http://localhost:5173")); // FE origin
        c.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        c.setAllowedHeaders(List.of("*"));
        c.setAllowCredentials(true);
        return c;
      }))
      .authorizeHttpRequests(auth -> auth
        // Cho phép các endpoint public
        .requestMatchers("/", "/error", "/public/**", "/actuator/health").permitAll()
        .requestMatchers(HttpMethod.GET, "/oauth2/**", "/login/**").permitAll()

        // ✅ Local auth API: permitAll để Postman gọi không bị redirect
        .requestMatchers(HttpMethod.POST, "/api/login", "/api/signup").permitAll()

        // Các API khác yêu cầu auth
        .requestMatchers("/api/**").authenticated()
        .anyRequest().authenticated()
      )

      // ✅ Khi gọi /api/** mà chưa auth ⇒ trả 401 JSON (không redirect Google)
      .exceptionHandling(e -> e
        .defaultAuthenticationEntryPointFor(
          (req, res, ex) -> {
            res.setStatus(401);
            res.setContentType("application/json;charset=UTF-8");
            res.getWriter().write("{\"error\":\"unauthorized\"}");
          },
          new AntPathRequestMatcher("/api/**")
        )
      )

      // OAuth2 login cho flow Google
      .oauth2Login(o -> o.successHandler(successHandler))

      .logout(l -> l.logoutUrl("/logout").logoutSuccessUrl("/"));

    return http.build();
  }
}
