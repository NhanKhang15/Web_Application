package com.example.backend.notification.service;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.example.backend.auction.domain.auction.Auction;
import com.example.backend.auction.domain.auction.Bid;
import com.example.backend.security.auth.User;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendBidPlacedEmail(Bid bid) {
        User user = bid.getBidder();
        Auction auction = bid.getAuction();

        String subject = "[AuctionSite] Bạn vừa đặt bid cho " + auction.getItem().getTitle();

        String content = """
                Xin chào %s,

                Bạn vừa đặt một bid mới trên hệ thống AuctionSite.

                Thông tin chi tiết:
                - Sản phẩm: %s
                - Mã đấu giá: %d
                - Số tiền bạn đặt: %s
                - Thời gian đặt: %s
                - Thời gian kết thúc đấu giá: %s

                Bạn có thể xem chi tiết tại: %s

                Email này được gửi tự động, vui lòng không trả lời lại.

                Trân trọng,
                AuctionSite Team
                """.formatted(
                user.getUsername(), // Or getDisplayName() if available
                auction.getItem().getTitle(),
                auction.getAuctionID(),
                bid.getBidAmount().toPlainString(),
                bid.getBidTime(),
                auction.getEndDate(),
                buildAuctionUrl(auction.getItem().getSlug()));

        sendEmail(user.getEmail(), subject, content);
    }

    public void sendAuctionWonEmail(Auction auction, User winner, Bid bid) {
        String subject = "Chúc mừng! Bạn đã thắng đấu giá \"" + auction.getItem().getTitle() + "\"";

        String content = """
                Xin chào %s,

                Chúc mừng, bạn là người chiến thắng đấu giá:

                - Sản phẩm: %s
                - Giá thắng: %s
                - Thời gian kết thúc: %s
                - Mã đấu giá: %d

                Thông tin người bán:
                - Tên: %s
                - Email liên hệ: %s

                Vui lòng liên hệ người bán để hoàn tất giao dịch.

                Trân trọng,
                AuctionSite Team
                """.formatted(
                winner.getUsername(),
                auction.getItem().getTitle(),
                auction.getFinalPrice() != null ? auction.getFinalPrice().toPlainString()
                        : bid.getBidAmount().toPlainString(),
                auction.getEndDate(),
                auction.getAuctionID(),
                auction.getItem().getSeller().getUsername(),
                auction.getItem().getSeller().getEmail());

        sendEmail(winner.getEmail(), subject, content);
    }

    public void sendAuctionSoldEmail(Auction auction, User seller, Bid bid) {
        String subject = "Sản phẩm \"" + auction.getItem().getTitle() + "\" đã được đấu giá thành công";

        User winner = auction.getWinner();

        String content = """
                Xin chào %s,

                Sản phẩm của bạn đã được đấu giá thành công.

                - Giá cuối cùng: %s
                - Người mua: %s (%s)

                Vui lòng liên hệ người mua để hoàn tất giao dịch.

                Trân trọng,
                AuctionSite Team
                """.formatted(
                seller.getUsername(),
                auction.getFinalPrice() != null ? auction.getFinalPrice().toPlainString()
                        : bid.getBidAmount().toPlainString(),
                winner.getUsername(),
                winner.getEmail());

        sendEmail(seller.getEmail(), subject, content);
    }

    private void sendEmail(String to, String subject, String content) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, false); // false for plain text, true for HTML

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

    private String buildAuctionUrl(String slug) {
        return "http://localhost:5174/dashboard/auctions/main/" + slug;
    }
}
