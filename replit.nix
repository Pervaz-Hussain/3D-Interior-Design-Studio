{pkgs}: {
  deps = [
    pkgs.python311Packages.pillow
    pkgs.postgresql
  ];
}
