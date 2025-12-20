package com.example.backend.image;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
public class FileController {

  private final CloudinaryService cloudinaryService;

  public FileController(CloudinaryService cloudinaryService) {
    this.cloudinaryService = cloudinaryService;
  }

  @PostMapping("/upload")
  public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file) {
    try {
      // Upload directly to Cloudinary - returns full Cloudinary URL
      String cloudinaryUrl = cloudinaryService.uploadImage(file, "avatars");

      return ResponseEntity.ok(new UploadResponse(true, cloudinaryUrl, "Upload thành công"));

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(new UploadResponse(false, null, e.getMessage()));
    }
  }

  // DTO phản hồi
  record UploadResponse(boolean success, String url, String message) {
  }
}
