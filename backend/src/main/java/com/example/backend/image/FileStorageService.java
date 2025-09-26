package com.example.backend.image;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

  private final Path root;
  private static final Set<String> ALLOWED = Set.of("png","jpg","jpeg","webp");

  public FileStorageService(@Value("${app.upload.dir}") String uploadDir) throws IOException {
    this.root = Paths.get(uploadDir).toAbsolutePath().normalize();
    Files.createDirectories(this.root); // tạo nếu chưa có
  }

  public String storeImage(MultipartFile file) throws IOException {
    if (file == null || file.isEmpty()) {
      throw new IOException("File rỗng");
    }

    // Lấy đuôi file an toàn
    String filename = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
    String ext = "";
    int dot = filename.lastIndexOf('.');
    if (dot >= 0) ext = filename.substring(dot + 1).toLowerCase();

    if (!ALLOWED.contains(ext)) {
      throw new IOException("Chỉ cho phép ảnh: " + ALLOWED);
    }

    // (tùy chọn) kiểm MIME
    String contentType = file.getContentType();
    if (contentType == null || !contentType.startsWith("image/")) {
      throw new IOException("Sai MIME type: " + contentType);
    }

    // Tạo tên file duy nhất: {epoch}_{uuid}.{ext}
    String safeName = Instant.now().getEpochSecond() + "_" + UUID.randomUUID() + "." + ext;

    // Lưu
    Path target = this.root.resolve(safeName).normalize();
    // ngăn path traversal
    if (!target.getParent().equals(this.root)) {
      throw new IOException("Đường dẫn không hợp lệ");
    }
    Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

    return safeName; // trả tên file để build URL ở controller
  }
}
