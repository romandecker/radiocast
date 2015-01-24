mplayer -ao pcm:fast:file=/dev/fd/3 \
        -vo null \
        -vc null \
        $1 3>&1 1>&2 | lame -V0 -q0 --vbr-new - $2
