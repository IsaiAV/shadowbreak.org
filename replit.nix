{pkgs}: {
  deps = [
    pkgs.haskellPackages.exiftool
    pkgs.jq
    pkgs.python312Packages.graphviz
    pkgs.python311Packages.libxml2
    pkgs.haskellPackages.zlib
    pkgs.gfortran48
    pkgs.deepin.dwayland
    pkgs.imagemagick6
    pkgs.haskellPackages.sox
    pkgs.xsimd
    pkgs.libxcrypt
    pkgs.tk
    pkgs.tcl
    pkgs.qhull
    pkgs.pkg-config
    pkgs.gtk3
    pkgs.gobject-introspection
    pkgs.ghostscript
    pkgs.freetype
    pkgs.ffmpeg-full
    pkgs.cairo
    pkgs.glibcLocales
    pkgs.postgresql
    pkgs.openssl
  ];
}
