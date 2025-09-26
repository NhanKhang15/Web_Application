package com.example.backend.image;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/files")
public class FileController {

  private final FileStorageService storage;

  public FileController(FileStorageService storage) {
    this.storage = storage;
  }

  @PostMapping("/upload")
  public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file) {
    try {
      String savedName = storage.storeImage(file);

      String url = ServletUriComponentsBuilder
              .fromCurrentContextPath()
              .path("/uploads/")
              .path(savedName)
              .toUriString();

      return ResponseEntity.ok(new UploadResponse(true, url, savedName));

    } catch (Exception e) {
      return ResponseEntity.badRequest().body(new UploadResponse(false, null, e.getMessage()));
    }
  }

  // DTO phản hồi
  record UploadResponse(boolean success, String url, String message) {}
}
