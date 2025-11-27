package com.example.backend.auction.domain.message;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Integer> {
        @Query("SELECT m FROM Message m WHERE m.auction.auctionID = :auctionId " +
                        "AND ((m.sender.userId = :user1 AND m.receiver.userId = :user2) " +
                        "OR (m.sender.userId = :user2 AND m.receiver.userId = :user1)) " +
                        "ORDER BY m.sentAt ASC")
        List<Message> findChatHistory(@Param("auctionId") Integer auctionId,
                        @Param("user1") Integer user1Id,
                        @Param("user2") Integer user2Id);

        // New method for one-way chat history
        List<Message> findBySender_UserIdAndReceiver_UserIdOrderBySentAtAsc(Integer senderId, Integer receiverId);

        @Query("SELECT m FROM Message m WHERE " +
                        "(m.sender.userId = :user1 AND m.receiver.userId = :user2) OR " +
                        "(m.sender.userId = :user2 AND m.receiver.userId = :user1) " +
                        "ORDER BY m.sentAt ASC")
        List<Message> findConversation(@Param("user1") Integer user1Id, @Param("user2") Integer user2Id);

        @Query("SELECT m FROM Message m WHERE m.sender.userId = :userId OR m.receiver.userId = :userId ORDER BY m.sentAt DESC")
        List<Message> findLatestMessagesByUser(@Param("userId") Integer userId);
}