package com.example.sca_be.global.security.principal;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.example.sca_be.domain.auth.entity.Member;
import com.example.sca_be.domain.auth.entity.Role;

import java.util.Collection;
import java.util.Collections;

public class CustomUserDetails implements UserDetails {
    private final Integer memberId;
    private final String username;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(Member member) {
        this.memberId = member.getMemberId();
        this.username = member.getUsername();
        this.password = member.getPassword();

        // "ROLE_" + "TEACHER" 또는 "ROLE_" + "STUDENT"
        this.authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + member.getRole().name())
        );
    }

    public Integer getMemberId() {
        return memberId;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // 계정이 가진 권한 목록 반환
        return this.authorities;
    }

    @Override
    public String getPassword() {
        // 계정의 비밀번호 반환
        return this.password;
    }

    @Override
    public String getUsername() {
        // 계정의 식별자(로그인 ID) 반환
        return this.username;
    }

    // --- 계정 상태 관련 메서드 ---
    //우리는 이거 안 쓸거니까 다 true로 하드 코딩

    @Override
    public boolean isAccountNonExpired() {
        // 계정이 만료되지 않았는지 (true: 만료 안 됨)
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        // 계정이 잠기지 않았는지 (true: 잠기지 않음)
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        // 비밀번호가 만료되지 않았는지 (true: 만료 안 됨)
        return true;
    }

    @Override
    public boolean isEnabled() {
        // 계정이 활성화되었는지 (true: 활성화됨)
        return true;
    }
}
