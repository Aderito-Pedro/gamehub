class Users::SessionsController < Devise::SessionsController
  def guest_login
    # Create an ephemeral guest user
    guest_user = User.create!(
      email: "guest_#{SecureRandom.hex(6)}@gamehub.local",
      password: SecureRandom.hex(16),
      guest: true
    )
    sign_in(:user, guest_user)
    redirect_to root_path, notice: "Entrou como Visitante! Seus pontos não serão mantidos permanentemente a menos que crie uma conta."
  end
end