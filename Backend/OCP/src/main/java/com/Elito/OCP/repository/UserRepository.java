package com.Elito.OCP.repository;

import com.Elito.OCP.domain.USER_ROLE;
import com.Elito.OCP.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepository extends JpaRepository<User,Long> {
    User findByEmail(String email);
    List<User> findByRole(USER_ROLE role);
    Long countByRole(USER_ROLE role);
    List<User> findTop5ByOrderByIdDesc();
    List<User> findByRoleIn(List<USER_ROLE> roles);
    List<User> findTop5ByRoleInOrderByIdDesc(List<USER_ROLE> roles);
    long countByRoleIn(List<USER_ROLE> roles);

}
