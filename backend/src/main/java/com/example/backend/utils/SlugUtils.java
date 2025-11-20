package com.example.backend.utils;

import java.text.Normalizer;
import java.util.regex.Pattern;

public class SlugUtils {
    public static String toSlug(String input) {
        if (input == null)
            return "";
        // 1. Bỏ dấu tiếng Việt
        String nfdNormalizedString = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String slug = pattern.matcher(nfdNormalizedString).replaceAll("").toLowerCase();

        // 2. Thay ký tự lạ bằng gạch ngang, bỏ khoảng trắng thừa
        slug = slug.replaceAll("[^a-z0-9\\s-]", "");
        slug = slug.replaceAll("\\s+", "-");

        // 3. Thêm timestamp để đảm bảo DUY NHẤT (tránh lỗi trùng lặp DB)
        slug += "-" + System.currentTimeMillis();

        return slug;
    }
}
