package com.example.backend.security.google_facebook_auth;


import com.example.backend.security.auth.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
  private final SocialAuthService socialService;
  private final JwtService jwt;

  @Value("${app.frontend.callback}")
  private String frontendCallback;

  @Override
  public void onAuthenticationSuccess(HttpServletRequest req, HttpServletResponse res,
                                      Authentication auth) throws IOException, ServletException {
    OAuth2User principal = (OAuth2User) auth.getPrincipal();
    // upsert user theo Google attributes
    User u = socialService.upsertFromGoogleAttributes(principal.getAttributes());

    String token = jwt.generate(u.getUserId(), u.getUsername(), "USER");
    String redirect = frontendCallback + "?token=" + token;
    getRedirectStrategy().sendRedirect(req, res, redirect);
  }
}