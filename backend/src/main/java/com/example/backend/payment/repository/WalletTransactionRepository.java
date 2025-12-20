package com.example.backend.payment.repository;

import com.example.backend.payment.entity.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {
    List<WalletTransaction> findByUser_UserIdOrderByCreatedAtDesc(Integer userId);

    List<WalletTransaction> findByUser_UserIdOrderByCreatedAtAsc(Integer userId);
}
