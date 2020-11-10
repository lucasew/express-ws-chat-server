with import <nixpkgs> {};
stdenv.mkDerivation {
  name = "environment";
  shellHook = ''
  '';
  buildInputs = [
    nodejs
    yarn
  ];
}
