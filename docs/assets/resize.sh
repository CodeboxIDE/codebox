
# Removing old files
for file in *_722.png; do
  rm "$file"
done


# Resizing new file
for file in *.png; do
  sips --resampleWidth 722 --out ${file%.png}_722.png $file
done