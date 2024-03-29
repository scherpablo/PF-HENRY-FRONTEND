// HOOKS
import { useEffect, useState } from "react";
// MATERIAL UI
import { Box, Typography, Avatar, Rating } from "@mui/material";
import { useTheme } from "@emotion/react";
import useMediaQuery from "@mui/material/useMediaQuery";
// SERVICES
import { googleReviewsServices } from "../../services/googleReviewsServices";
//UTILS
import { reviewsUsers } from "../../utils/objectsTexts";
import Swal from "sweetalert2";

const ReviewsComponent = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await googleReviewsServices();
        setReviews(data);
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error al obtener las reseñas",
          text: "Por favor, vuelva mas tarde.",
        });
      }
    };
    fetchReviews();
  }, []);

  return (
    <>
      <Box sx={{ minHeight: "70vh" }}>
        <Box
          sx={{
            backgroundColor: "#000",
            width: "100%",
            
            height: "120px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "#fff",
              fontSize: "1.7rem",
              textAlign: "center",
              textTransform: "uppercase",
              fontWeight: "800",
              margin: "10px",
            }}
          >
            Reseñas de nuestros clientes
          </Typography>
        </Box>

        <Box>
          {reviewsUsers.map((item, index) => {
            return (
              <Box
                key={index}
                sx={{
                  textAlign: "center",
                  padding: "20px 0",
                  backgroundColor: "#f5f5f5",
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: "700" }}>
                  {item.title}
                </Typography>
                <Box sx={{ width: "60%", margin: "0 auto" }}>
                  {item.content.map((paragraph, pIndex) => {
                    return (
                      <Typography
                        key={pIndex}
                        sx={{
                          fontSize: "1.2em",
                          fontWeight: "500",
                          textAlign: "justify",
                          marginTop: "25px",
                        }}
                      >
                        {paragraph.text}
                      </Typography>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Box>

        <Box sx={{ padding: "2em", backgroundColor: "#f5f5f5" }}>
          {reviewsUsers.map((item, index) => {
            <Box key={index} sx={{ backgroundColor: "red" }}>
              <Typography variant="h3">{item.title}</Typography>
            </Box>;
          })}
          <Box
            sx={{
              display: "grid",
              justifyContent: "center",
              alignContent: "space-evenly",
              alignItems: "center",
              justifyItems: "center",
              gridTemplateColumns: {
                xs: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
                md: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              },
              gap: "16px",
              margin: "auto",
              maxWidth: "1200px",
              width: { xs: "200px", md: "500px" },
            }}
          >
            {reviews.map((review, index) => (
              <Box
                key={index}
                sx={{
                  backgroundColor: "whiter",
                  padding: "1em",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px 0 hsla(0, 0%, 0%, 0.2)",
                  width: isMobile ? "300px" : "300px",
                  height: "300px",
                  overflow: "auto",
                  transition: "transform 0.3s ease-in-out",
                  "&:hover": { transform: "scale(1.05)" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar
                    sx={{
                      width: "60px",
                      height: "60px",
                      marginBottom: "0.5em",
                    }}
                    src={review.profile_photo_url}
                  />
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ marginLeft: "10px" }}
                  >
                    <strong>{review.author_name}</strong>
                  </Typography>
                </Box>
                <Rating name="read-only" value={review.rating} readOnly />
                <Typography variant="body2">{review.text}</Typography>
              </Box>
            ))}
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "nowrap",
              alignContent: "space-around",
              justifyContent: "space-around",
              alignItems: "center",
              padding: "30px 0",
              width: { xs: "auto", md: "auto" },
              marginBottom: { xs: "60px" },
              backgroundColor: "#f5f5f5",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                paddingTop: 10,
                paddingBottom: {xxs:10, xs:0},
                fontSize: "1.2em",
                fontWeight: "500",
                textAlign: "justify",
                //marginTop: "25px",
              }}
            >
              Si quieres dejar tu propia reseña pulsa{" "}
              <a
                href="https://maps.app.goo.gl/rGM9QV8Z8RGH2mYu8"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: theme.palette.primary.main,
                  textDecoration: "none",
                }}
              >
                aquí
              </a>
              .
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ReviewsComponent;
