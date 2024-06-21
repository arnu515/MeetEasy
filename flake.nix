{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs = {nixpkgs, ...}: {
    devShells = nixpkgs.lib.genAttrs [
      "x86_64-linux"
      "aarch64-linux"
      "x86_64-darwin"
      "aarch64-darwin"
    ] (system: let pkgs = nixpkgs.legacyPackages.${system}; in{
      default = pkgs.mkShell {
        name = "Twilio Hackathon dev-shell";

        packages = with pkgs; [
          bun
          nodejs_22
        ];
      };
    });
  };
}
