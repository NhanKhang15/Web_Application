package com.example.backend.image;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;
    private static final Set<String> ALLOWED = Set.of("png", "jpg", "jpeg", "webp");

    public CloudinaryService(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true));
    }

    /**
     * Upload image to Cloudinary
     * 
     * @param file   MultipartFile to upload
     * @param folder Folder name on Cloudinary (e.g., "avatars", "auctions")
     * @return Cloudinary URL of the uploaded image
     */
    public String uploadImage(MultipartFile file, String folder) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IOException("File rỗng");
        }

        // Validate file extension
        String filename = StringUtils.cleanPath(
                file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        String ext = "";
        int dot = filename.lastIndexOf('.');
        if (dot >= 0)
            ext = filename.substring(dot + 1).toLowerCase();

        if (!ALLOWED.contains(ext)) {
            throw new IOException("Chỉ cho phép ảnh: " + ALLOWED);
        }

        // Validate MIME type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IOException("Sai MIME type: " + contentType);
        }

        // Upload to Cloudinary
        @SuppressWarnings("unchecked")
        Map<String, Object> uploadResult = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", folder,
                        "resource_type", "image"));

        // Return the secure URL
        return (String) uploadResult.get("secure_url");
    }

    /**
     * Upload image with default folder "uploads"
     */
    public String uploadImage(MultipartFile file) throws IOException {
        return uploadImage(file, "uploads");
    }
}
