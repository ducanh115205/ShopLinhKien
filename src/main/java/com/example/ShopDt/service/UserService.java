package com.example.ShopDt.service;

import com.example.ShopDt.dto.request.RegisterRequest;
import com.example.ShopDt.dto.request.UpdateRequest;
import com.example.ShopDt.dto.response.LoginResponse;
import com.example.ShopDt.dto.response.UserResponse;
import com.example.ShopDt.entity.Role;
import com.example.ShopDt.entity.User;
import com.example.ShopDt.mapper.user.UserMapper;
import com.example.ShopDt.repository.RoleRepository;
import com.example.ShopDt.repository.UserRepository;
import com.example.ShopDt.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final RoleRepository roleRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private  final CurrentUserService currentUserService;

    public UserResponse createUser(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            log.warn("Email '{}' đã tồn tại", request.getEmail());
            throw new IllegalArgumentException("Email đã tồn tại");
        }

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Ten dang nhap da ton tai");
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            log.warn("Mật khẩu là bắt buộc");
            throw new IllegalArgumentException("Mật khẩu là bắt buộc");
        }

        User user = userMapper.toUser(request);
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setStatus(1);
        user.setCreateAt(LocalDateTime.now());
        Role role = roleRepository.findById(2L)
                .orElseThrow(() -> new IllegalArgumentException("Role không tồn tại"));
        user.setRole(role);

        User savedUser = userRepository.save(user);

        return userMapper.toUserResponse(savedUser);
    }

    //  Login bằng username và password
    public LoginResponse login(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy username: " + username));

        if (user.getStatus() < 0) {
            throw new IllegalArgumentException("Tai khoan da bi khoa hoac chua duoc kich hoat");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Sai mật khẩu!");
        }

        String token = jwtService.generateToken(username, Map.of(
                "userId", user.getId(),
                "email", user.getEmail(),
                "role", user.getRole().getName()
        ));

        log.info("User '{}' đã đăng nhập thành công", username);

        return new LoginResponse(user.getId(),token, user.getUsername(), user.getRole().getName());
    }
    //lấy profile
    public UserResponse getProfile(String token) {
        String username = jwtService.extractUsername(token);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy user: " + username));

        return userMapper.toUserResponse(user);
    }

    // Update user đang login
    public UserResponse updateUser(UpdateRequest request) {

        User user = currentUserService.getCurrentUser();


        if (request.getUsername() != null && !request.getUsername().isBlank()
                && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.findByUsername(request.getUsername()).isPresent()) {
                throw new IllegalArgumentException("Ten dang nhap da ton tai");
            }
            user.setUsername(request.getUsername());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return userMapper.toUserResponse(userRepository.save(user));
    }

    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getUsers() {
        log.info("In method get Users");
        return userRepository.findAll().stream().map(userMapper::toUserResponse).toList();
    }

    // Thêm User từ Admin
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse adminCreateUser(String username, String email, String password, Long roleId) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email đã tồn tại");
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setStatus(1); // 1 = Hoạt động
        user.setCreateAt(java.time.LocalDateTime.now());

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Quyền không tồn tại"));
        user.setRole(role);

        return userMapper.toUserResponse(userRepository.save(user));
    }

    // Sửa Email và Quyền User từ Admin
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse adminUpdateUser(Long id, String email, Long roleId) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Kiểm tra xem email mới có bị trùng với user khác không
        if (!user.getEmail().equals(email) && userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("Email đã được sử dụng bởi tài khoản khác");
        }

        user.setEmail(email);

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Quyền không tồn tại"));
        user.setRole(role);

        return userMapper.toUserResponse(userRepository.save(user));
    }


}
