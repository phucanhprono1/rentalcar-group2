package fa.training.carrental.services;

import fa.training.carrental.dto.*;
import fa.training.carrental.entities.Account;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Optional;

public interface EditProfileService {
    EditProfileResponse editProfile(EditProfileRequest request,MultipartFile file);
    EditProfileResponse editPassword(EditPasswordRequest request);
    ProfileResponse getProfile(String username);
    Optional<Account> getAccount(String email);
}
