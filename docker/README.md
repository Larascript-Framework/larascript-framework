## Debugging Docker Container

```bash
docker commit api test_image
docker run -ti --entrypoint=sh test_image
```

You can now inspect the container and see what is available.


