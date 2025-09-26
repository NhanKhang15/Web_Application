package com.example.backend.security.config;

import com.example.backend.security.google_facebook_auth.OAuth2SuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
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
        c.setAllowedOrigins(List.of("http://localhost:5174")); // FE origin
        c.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        c.setAllowedHeaders(List.of("*"));
        c.setAllowCredentials(true);
        return c;
      }))
      .authorizeHttpRequests(auth -> auth
        // Public web & oauth
        .requestMatchers("/", "/error", "/public/**", "/actuator/health").permitAll()
        .requestMatchers("/oauth2/**", "/login/**").permitAll()

        // Local auth API (JWT trong body)
        .requestMatchers(HttpMethod.POST, "/api/login", "/api/signup").permitAll()

        // debug/test (dev)
        .requestMatchers("/api/test/**").permitAll()

        // image upload
        .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()

        // nếu bạn còn dùng /api/auth/me để debug → mở tạm
        .requestMatchers("/api/auth/me").permitAll()

        // các API khác: tạm thời mở để dev cho đỡ 401
        .anyRequest().permitAll()
      )
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
      .oauth2Login(o -> o.successHandler(successHandler))
      .logout(l -> l.logoutUrl("/logout").logoutSuccessUrl("/"));

    return http.build();
  }

  // cần nếu bạn dùng AuthenticationManager cho login form
  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
    return configuration.getAuthenticationManager();
  }
}
