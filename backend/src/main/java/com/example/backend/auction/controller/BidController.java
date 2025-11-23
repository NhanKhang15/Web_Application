package com.example.backend.auction.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.auction.domain.auction.Bid;

import com.example.backend.auction.domain.auction.dto.BidResult;
import com.example.backend.auction.domain.auction.dto.PlaceBidRequest;
import com.example.backend.auction.domain.auction.dto.BidHistoryDTO;
import com.example.backend.auction.domain.auction.dto.BidResponseDTO;
import com.example.backend.auction.domain.auction.BidRepository;
import com.example.backend.auction.service.BidService;
import com.example.backend.security.auth.User;
import com.example.backend.security.auth.UserRepository;

@RestController
@RequestMapping("/api/bids")
public class BidController {

    private final BidService bidService;
    private final UserRepository userRepository;
    private final BidRepository bidRepository;

    public BidController(BidService bidService, UserRepository userRepository, BidRepository bidRepository) {
        this.bidService = bidService;
        this.userRepository = userRepository;
        this.bidRepository = bidRepository;
    }

    @PostMapping
    public ResponseEntity<?> placeBid(@RequestBody PlaceBidRequest request,
            Authentication authentication,
            @AuthenticationPrincipal Object principal) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("User must be logged in");
        }

        String username = null;
        String email = null;

        if (principal instanceof UserDetails userDetails) {
            username = userDetails.getUsername();
        } else if (principal instanceof OAuth2User oauth2User) {
            username = (String) oauth2User.getAttributes().getOrDefault("name", null);
            email = (String) oauth2User.getAttributes().getOrDefault("email", null);
        }

        if (username == null && authentication.getPrincipal() instanceof OAuth2User oauthPrincipal) {
            username = (String) oauthPrincipal.getAttributes().getOrDefault("name", null);
            email = (String) oauthPrincipal.getAttributes().getOrDefault("email", null);
        }

        Optional<User> userOpt = Optional.empty();

        if (username != null && userRepository.existsByUsername(username)) {
            userOpt = userRepository.findByUsername(username);
        }

        if (userOpt.isEmpty() && email != null && userRepository.existsByEmail(email)) {
            userOpt = userRepository.findByEmail(email);
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body("User not found");
        }

        User user = userOpt.get();

        BidResult result = bidService.placeBid(request.getAuctionId(), user.getUserId(), request.getAmount());

        if (result.isSuccess()) {
            Bid bid = result.getBid();
            BidResponseDTO response = new BidResponseDTO(
                    bid.getBidID(),
                    bid.getAuction().getAuctionID(),
                    bid.getBidder().getUsername(),
                    bid.getBidAmount(),
                    bid.getBidTime());
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(result.getMessage());
        }
    }

    @GetMapping("/auction/{auctionId}")
    public ResponseEntity<List<Bid>> getBids(@PathVariable Integer auctionId) {
        return ResponseEntity.ok(bidService.getBidsForAuction(auctionId));
    }

    @GetMapping("/history/{auctionId}")
    public ResponseEntity<List<BidHistoryDTO>> getBidHistory(@PathVariable Integer auctionId) {
        List<BidHistoryDTO> history = bidRepository.findBidHistoryByAuctionId(auctionId);
        return ResponseEntity.ok(history);
    }
}
