package com.Elito.OCP.repository;

import com.Elito.OCP.model.ForgotPasswordToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface ForgotPasswordRepository extends JpaRepository<ForgotPasswordToken, String> {

    ForgotPasswordToken findByUserId(Long userId);

    @Modifying
    @Transactional
    @Query("DELETE FROM ForgotPasswordToken f WHERE f.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}



/*package com.Elito.OCP.repository;

import com.Elito.OCP.model.ForgotPasswordToken;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ForgotPasswordRepository extends JpaRepository<ForgotPasswordToken , String> {

    ForgotPasswordToken findByUserId(Long userId);

}*/
