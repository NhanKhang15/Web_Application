package com.example.backend.payment.repository;

import com.example.backend.payment.entity.TopupOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TopupOrderRepository extends JpaRepository<TopupOrder, Long> {
}
