package com.example.backend.auction.domain.auction.dto;

import java.util.List;

// DTO chứa danh sách Categories và Locations để Frontend hiển thị
public record FilterOptionsDto(
        List<CategoryDto> categories,
        List<String> locations
) {}

