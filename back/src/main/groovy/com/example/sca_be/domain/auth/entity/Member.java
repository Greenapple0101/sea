package com.example.sca_be.domain.auth.entity;

import com.example.sca_be.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "members")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Member extends BaseTimeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_id")
    private Integer memberId;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(name = "real_name", nullable = false, length = 50)
    private String realName;

    @Column(unique = true, nullable = false, length = 50)
    private String nickname;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Enumerated(EnumType.STRING) //학생 혹은 선생님
    @Column(nullable = false, length = 20)
    private Role role;
    
    //created at는 자동생성

    //이걸로 member 객체에서 .getStudent()로 학생 정보 접근 가능
    @OneToOne(mappedBy = "member", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Student student;

    @OneToOne(mappedBy = "member", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Teacher teacher;

    @Builder
    public Member(String username, String password, String realName, String nickname, String email, Role role) {
        this.username = username;
        this.password = password;
        this.realName = realName;
        this.nickname = nickname;
        this.email = email;
        this.role = role;
    }
}
