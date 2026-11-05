package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.RegisterRequest;
import be.vinci.ipl.cae.demo.services.MemberService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private MemberService memberService;

  @Autowired
  private ObjectMapper objectMapper;

  @Test
  @WithMockUser
  void register_ValidRequest_ReturnsCreated() throws Exception {
    // Arrange
    Mockito.when(memberService.register(
            ArgumentMatchers.anyString(),
            ArgumentMatchers.anyString(),
            ArgumentMatchers.anyString(),
            ArgumentMatchers.any(),
          ArgumentMatchers.nullable(String.class)))
        .thenReturn(true);

    // Act & Assert
    mockMvc.perform(MockMvcRequestBuilders.post("/auths/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(createValidRegisterRequest())))
        .andExpect(MockMvcResultMatchers.status().isCreated());
  }

  @Test
  @WithMockUser
  void register_InvalidRequest_ReturnsBadRequest() throws Exception {
    mockMvc.perform(MockMvcRequestBuilders.post("/auths/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{}"))
        .andExpect(MockMvcResultMatchers.status().isBadRequest());
  }

  @Test
  @WithMockUser
  void register_WeakPassword_ReturnsBadRequest() throws Exception {
    RegisterRequest request = new RegisterRequest(
        "test@vinci.be",
        "TestTag",
        "weakpwd",
        "TACTICIAN",
        null);

    mockMvc.perform(MockMvcRequestBuilders.post("/auths/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(objectMapper.writeValueAsString(request)))
        .andExpect(MockMvcResultMatchers.status().isBadRequest());
  }

  private RegisterRequest createValidRegisterRequest() {
    return new RegisterRequest(
        "test@vinci.be",
        "TestTag",
        "password123!",
        "TACTICIAN",
        null);
  }
}
